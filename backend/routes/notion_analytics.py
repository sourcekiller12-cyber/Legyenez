from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List
import logging
import csv
import io
from datetime import datetime

from models_analytics import NotionAnalyticsRow, AnalyticsData
from routes.auth import get_current_user
from database import db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/import-csv")
async def import_notion_csv(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """
    Import Notion CSV export with analytics data.
    Columns: Social File, Retention Hook, Hook Title, Dominance Line, Open Loop, Close, Resolve Script, WH (secs), Retention %, Like, Comments, Sub-2/1000 views
    """
    try:
        # Read CSV content
        content = await file.read()
        decoded = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Map CSV columns to model fields
                analytics_row = NotionAnalyticsRow(
                    social_file=row.get('Social File', '').strip(),
                    retention_hook=row.get('Retention Hook', '').strip(),
                    hook_title=row.get('Hook Title', '').strip(),
                    dominance_line=row.get('Dominance Line', '').strip() or None,
                    open_loop=row.get('Open Loop', '').strip() or None,
                    close=row.get('Close', '').strip() or None,
                    resolve_script=row.get('Resolve Script', '').strip(),
                    watch_hours_secs=float(row.get('WH (secs)', 0) or 0),
                    retention_percent=float(row.get('Retention %', 0) or 0),
                    likes=int(row.get('Like', 0) or 0),
                    comments=int(row.get('Comments', 0) or 0),
                    subs_per_1000_views=float(row.get('Sub-2/1000 views', 0) or 0)
                )
                
                # Create AnalyticsData object
                analytics_data = AnalyticsData(
                    user_id=current_user["id"],
                    **analytics_row.model_dump()
                )
                
                # Save to database
                data_dict = analytics_data.model_dump()
                data_dict['created_at'] = data_dict['created_at'].isoformat()
                
                await db.analytics_data.insert_one(data_dict)
                imported_count += 1
            
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                logger.error(f"Error importing row {row_num}: {str(e)}")
        
        logger.info(f"Imported {imported_count} analytics rows for user {current_user['id']}")
        
        return {
            "success": True,
            "imported_count": imported_count,
            "total_rows": imported_count + len(errors),
            "errors": errors if errors else None
        }
    
    except Exception as e:
        logger.error(f"Error importing CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV import failed: {str(e)}")

@router.get("/export-csv")
async def export_analytics_csv(current_user = Depends(get_current_user)):
    """
    Export user's analytics data as CSV.
    """
    try:
        # Fetch all analytics data for user
        analytics = await db.analytics_data.find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        ).sort("retention_percent", -1).to_list(length=1000)
        
        if not analytics:
            raise HTTPException(status_code=404, detail="No analytics data found")
        
        # Create CSV in memory
        output = io.StringIO()
        fieldnames = [
            'social_file', 'retention_hook', 'hook_title', 'dominance_line',
            'open_loop', 'close', 'resolve_script', 'watch_hours_secs',
            'retention_percent', 'likes', 'comments', 'subs_per_1000_views', 'created_at'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in analytics:
            writer.writerow({
                'social_file': row.get('social_file', ''),
                'retention_hook': row.get('retention_hook', ''),
                'hook_title': row.get('hook_title', ''),
                'dominance_line': row.get('dominance_line', ''),
                'open_loop': row.get('open_loop', ''),
                'close': row.get('close', ''),
                'resolve_script': row.get('resolve_script', ''),
                'watch_hours_secs': row.get('watch_hours_secs', 0),
                'retention_percent': row.get('retention_percent', 0),
                'likes': row.get('likes', 0),
                'comments': row.get('comments', 0),
                'subs_per_1000_views': row.get('subs_per_1000_views', 0),
                'created_at': row.get('created_at', '')
            })
        
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=analytics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
    
    except Exception as e:
        logger.error(f"Error exporting CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV export failed: {str(e)}")

@router.get("/insights")
async def get_analytics_insights(current_user = Depends(get_current_user)):
    """
    Get analytics insights from imported data.
    Returns top performing hooks, dominance lines, open loops, close patterns.
    """
    try:
        # Top hooks by retention
        top_hooks = await db.analytics_data.find(
            {"user_id": current_user["id"]},
            {"_id": 0, "hook_title": 1, "retention_hook": 1, "retention_percent": 1, "likes": 1}
        ).sort("retention_percent", -1).limit(10).to_list(length=10)
        
        # Top dominance lines
        top_dominance = await db.analytics_data.find(
            {"user_id": current_user["id"], "dominance_line": {"$ne": None}},
            {"_id": 0, "dominance_line": 1, "retention_percent": 1}
        ).sort("retention_percent", -1).limit(10).to_list(length=10)
        
        # Top open loops
        top_open_loops = await db.analytics_data.find(
            {"user_id": current_user["id"], "open_loop": {"$ne": None}},
            {"_id": 0, "open_loop": 1, "retention_percent": 1}
        ).sort("retention_percent", -1).limit(10).to_list(length=10)
        
        # Top close patterns
        top_closes = await db.analytics_data.find(
            {"user_id": current_user["id"], "close": {"$ne": None}},
            {"_id": 0, "close": 1, "retention_percent": 1}
        ).sort("retention_percent", -1).limit(10).to_list(length=10)
        
        # Average metrics
        pipeline = [
            {"$match": {"user_id": current_user["id"]}},
            {
                "$group": {
                    "_id": None,
                    "avg_retention": {"$avg": "$retention_percent"},
                    "avg_likes": {"$avg": "$likes"},
                    "avg_comments": {"$avg": "$comments"},
                    "total_videos": {"$sum": 1}
                }
            }
        ]
        
        avg_stats = await db.analytics_data.aggregate(pipeline).to_list(length=1)
        
        return {
            "top_hooks": top_hooks,
            "top_dominance_lines": top_dominance,
            "top_open_loops": top_open_loops,
            "top_close_patterns": top_closes,
            "average_stats": avg_stats[0] if avg_stats else None
        }
    
    except Exception as e:
        logger.error(f"Error getting insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data", response_model=List[dict])
async def get_analytics_data(
    current_user = Depends(get_current_user),
    limit: int = 100,
    skip: int = 0
):
    """
    Get user's analytics data with pagination.
    """
    analytics = await db.analytics_data.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("retention_percent", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return analytics

@router.delete("/data/{analytics_id}")
async def delete_analytics_data(analytics_id: str, current_user = Depends(get_current_user)):
    """
    Delete analytics data entry.
    """
    result = await db.analytics_data.delete_one({
        "id": analytics_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analytics data not found")
    
    return {"message": "Analytics data deleted"}