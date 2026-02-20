import subprocess
import logging
from pathlib import Path
from typing import List, Optional, Dict
import json

logger = logging.getLogger(__name__)

class FFmpegService:
    """
    FFmpeg video assembly service for creating market-ready YouTube Shorts.
    - 9:16 vertical format
    - Karaoke subtitles (white → lemon yellow)
    - B-roll cuts every 2-3 seconds
    - Audio mixing (TTS + background music with ducking)
    - Safe zones (avoid YouTube UI buttons)
    """
    
    @staticmethod
    async def create_shorts_video(
        output_path: Path,
        audio_path: Path,
        broll_clips: List[Path],
        word_timestamps: List,
        script_text: str,
        background_music: Optional[str],
        duration: float
    ):
        """
        Create complete YouTube Shorts video with all elements.
        """
        try:
            # Step 1: Create concatenated B-roll video (2-3s cuts)
            concat_video = output_path.parent / f"{output_path.stem}_concat.mp4"
            await FFmpegService.concatenate_broll(broll_clips, concat_video, duration)
            
            # Step 2: Create karaoke subtitle file (ASS format for word-level highlighting)
            subtitle_path = output_path.parent / f"{output_path.stem}.ass"
            FFmpegService.create_karaoke_subtitles(
                subtitle_path, script_text, word_timestamps, duration
            )
            
            # Step 3: Assemble final video
            if background_music:
                # With background music
                await FFmpegService.assemble_with_music(
                    output_path, concat_video, audio_path, subtitle_path, background_music
                )
            else:
                # Without background music
                await FFmpegService.assemble_without_music(
                    output_path, concat_video, audio_path, subtitle_path
                )
            
            logger.info(f"Video assembled successfully: {output_path}")
        
        except Exception as e:
            logger.error(f"Error assembling video: {str(e)}")
            raise
    
    @staticmethod
    async def concatenate_broll(broll_clips: List[Path], output_path: Path, total_duration: float):
        """
        Concatenate B-roll clips to match total duration.
        Each clip is cut to 2-3 seconds and looped as needed.
        """
        if not broll_clips:
            # Create black video if no B-roll available
            cmd = [
                'ffmpeg', '-f', 'lavfi',
                '-i', f'color=c=black:s=1080x1920:d={total_duration}',
                '-pix_fmt', 'yuv420p',
                str(output_path), '-y'
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return
        
        # Create concat file
        concat_file = output_path.parent / "concat_list.txt"
        
        clip_duration = 2.5  # Average clip duration
        clips_needed = int(total_duration / clip_duration) + 1
        
        with open(concat_file, 'w') as f:
            for i in range(clips_needed):
                clip_idx = i % len(broll_clips)
                clip_path = broll_clips[clip_idx]
                
                # Write multiple times if needed
                f.write(f"file '{clip_path}'\n")
                f.write(f"inpoint 0\n")
                f.write(f"outpoint {clip_duration}\n")
        
        # Concatenate clips
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-vf', f'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
            '-t', str(total_duration),
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            str(output_path), '-y'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"FFmpeg concat error: {result.stderr}")
            raise Exception(f"Failed to concatenate B-roll: {result.stderr}")
    
    @staticmethod
    def create_karaoke_subtitles(
        output_path: Path,
        script_text: str,
        word_timestamps: List,
        duration: float
    ):
        """
        Create ASS subtitle file with karaoke effect.
        White text → lemon yellow for active word.
        Positioned in safe zone (avoiding YouTube UI).
        """
        # ASS header
        ass_content = """[Script Info]
Title: Karaoke Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,60,&H00FFFFFF,&H00FFFF00,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        
        # If no word timestamps, create simple subtitles
        if not word_timestamps or len(word_timestamps) == 0:
            # Split text into words
            words = script_text.split()
            avg_word_duration = duration / len(words) if words else 1.0
            
            current_time = 0.0
            for word in words:
                start_time = FFmpegService.format_ass_time(current_time)
                current_time += avg_word_duration
                end_time = FFmpegService.format_ass_time(current_time)
                
                ass_content += f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{{\\k{int(avg_word_duration * 100)}}}{word} "
        else:
            # Use word timestamps from ElevenLabs
            for i, char_data in enumerate(word_timestamps):
                if hasattr(char_data, 'character') and hasattr(char_data, 'start_time_ms'):
                    char = char_data.character
                    start_ms = char_data.start_time_ms
                    
                    # Find end time (next character or duration)
                    end_ms = duration * 1000
                    if i < len(word_timestamps) - 1 and hasattr(word_timestamps[i+1], 'start_time_ms'):
                        end_ms = word_timestamps[i+1].start_time_ms
                    
                    start_time = FFmpegService.format_ass_time(start_ms / 1000.0)
                    end_time = FFmpegService.format_ass_time(end_ms / 1000.0)
                    karaoke_duration = int((end_ms - start_ms) / 10)
                    
                    ass_content += f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{{\\k{karaoke_duration}}}{char}"
        
        # Write ASS file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(ass_content)
        
        logger.info(f"Created karaoke subtitles: {output_path}")
    
    @staticmethod
    def format_ass_time(seconds: float) -> str:
        """Format time for ASS subtitles: H:MM:SS.CC"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centisecs = int((seconds % 1) * 100)
        return f"{hours}:{minutes:02d}:{secs:02d}.{centisecs:02d}"
    
    @staticmethod
    async def assemble_with_music(
        output_path: Path,
        video_path: Path,
        audio_path: Path,
        subtitle_path: Path,
        music_path: str
    ):
        """
        Assemble video with TTS audio, background music, and subtitles.
        Apply volume ducking to music when TTS is playing.
        """
        cmd = [
            'ffmpeg',
            '-i', str(video_path),
            '-i', str(audio_path),
            '-i', music_path,
            '-filter_complex',
            (
                # Audio mixing with ducking
                f'[1:a]volume=1.0[voice];'
                f'[2:a]volume=0.3[music];'
                f'[voice][music]amix=inputs=2:duration=first:dropout_transition=2[audio];'
                # Subtitles
                f'[0:v]subtitles={subtitle_path}:force_style=\'Fontsize=60,PrimaryColour=&H00FFFFFF,SecondaryColour=&H0000FFFF,Outline=3,Shadow=2,MarginV=120\'[video]'
            ),
            '-map', '[video]',
            '-map', '[audio]',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            str(output_path), '-y'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"FFmpeg assembly error: {result.stderr}")
            raise Exception(f"Failed to assemble video: {result.stderr}")
    
    @staticmethod
    async def assemble_without_music(
        output_path: Path,
        video_path: Path,
        audio_path: Path,
        subtitle_path: Path
    ):
        """
        Assemble video with TTS audio and subtitles (no background music).
        """
        cmd = [
            'ffmpeg',
            '-i', str(video_path),
            '-i', str(audio_path),
            '-filter_complex',
            f'[0:v]subtitles={subtitle_path}:force_style=\'Fontsize=60,PrimaryColour=&H00FFFFFF,SecondaryColour=&H0000FFFF,Outline=3,Shadow=2,MarginV=120\'[video]',
            '-map', '[video]',
            '-map', '1:a',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            str(output_path), '-y'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"FFmpeg assembly error: {result.stderr}")
            raise Exception(f"Failed to assemble video: {result.stderr}")
