from itertools import islice
from os import stat_result
from tokenize import String
from flask import Flask, request, jsonify
import youtube_dl

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
        return ydl.extract_info(url)


@app.route('/')
def source_metadata():
    url = request.args.get('query', "")
    if url == "":
        return {"error": "No query provided"}

    metadata = get_video_metadata(url)
    isList = len(metadata.get('entries', [])) > 0

    return {
        "partial":  isList,
        "metadata": transform_list_meta(metadata) if isList else transform_video_meta(metadata),
        "raw": metadata
    }


@app.route('/url')
def source_url():
    url = request.args.get('query', "")
    if url == "":
        return {"error": "No URL provided"}

    metadata = get_video_metadata(url, noplaylist=True)

    return jsonify({"url": metadata.get("url", None)})


def transform_list_meta(metadata: dict):
    return [{
        "duration": entry.get("duration", None),
        "pageUrl": entry.get("webpage_url"),
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
