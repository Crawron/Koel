import sys
from logging.config import dictConfig

import youtube_dl
from flask import Flask, jsonify, request

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': sys.stdout,
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

app = Flask(__name__)


def get_video_metadata(url: str, noplaylist: bool = True) -> dict:
    ydl_opts = {
        "simulate": True,
        "noplaylist": noplaylist,
        "extract_flat": "in_playlist",
        "format": "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio/best[height<=480p]/worst",
        "quiet": True,
        "default_search": "ytsearch:",
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        try:
            return ydl.extract_info(url)
        except Exception as e:
            return {
                "query": url,
                "error": str(e)
            }


@app.route('/')
def source_metadata():
    query = request.args.get('query', "")
    if query == "":
        return {
            "query": query,
            "error": "No query provided"
        }

    metadata = get_video_metadata(query)
    if(metadata.get("error", None) is not None):
        return jsonify(metadata)

    isList = len(metadata.get('entries', [])) > 0

    return {
        "partial":  isList,
        "query": query,
        "metadata": transform_list_meta(metadata) if isList else transform_video_meta(metadata),
        "raw": metadata
    }


@app.route('/url')
def source_url():
    query = request.args.get('query', "")
    if query == "":
        return {
            "query": query,
            "error": "No URL provided"
        }

    metadata = get_video_metadata(query, noplaylist=True)

    return {
        "query": query,
        "url": metadata.get("url", None)
    }


def transform_list_meta(metadata: dict):
    return [{
        "duration": entry.get("duration", None),
        "pageUrl": entry.get("webpage_url", entry.get("url", None)),
        "uploader": entry.get("uploader", None),
        "title": entry.get("title"),
        "source": metadata.get("extractor_key"),
        "chapters": []
    } for entry in metadata.get("entries", [])]


def transform_video_meta(metadata: dict):
    return [{
        "title": metadata.get("title"),
        "mediaUrl": metadata.get("url", None),
        "pageUrl": metadata.get("webpage_url"),
        "source": metadata.get("extractor_key"),
        "duration": metadata.get("duration", None),
        "thumbnailUrl": metadata.get("thumbnail", None),
        "uploader": metadata.get("uploader", None),
        "chapters": [{
            "title": chapter.get("title"),
            "start": chapter.get("start_time")
        } for chapter in metadata.get("chapters", [])],
    }]


app.run(port=4863)
