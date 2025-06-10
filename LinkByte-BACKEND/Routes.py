from flask import jsonify
from flask_cors import cross_origin

sample_posts = [
    {"id": 1, "title": "First Adventure", "imageUrl": "https://placehold.co/600x400/FF5733/FFFFFF?text=Post+1"},
    {"id": 2, "title": "City Lights", "imageUrl": "https://placehold.co/600x400/33FF57/000000?text=Post+2"},
    {"id": 3, "title": "Mountain Trails", "imageUrl": "https://placehold.co/600x400/3357FF/FFFFFF?text=Post+3"},
    {"id": 4, "title": "Ocean Waves", "imageUrl": "https://placehold.co/600x400/FFFF33/000000?text=Post+4"},
    {"id": 5, "title": "Forest Mystery", "imageUrl": "https://placehold.co/600x400/8D33FF/FFFFFF?text=Post+5"},
    {"id": 6, "title": "Desert Bloom", "imageUrl": "https://placehold.co/600x400/FF33CC/000000?text=Post+6"},
    {"id": 7, "title": "Urban Garden", "imageUrl": "https://placehold.co/600x400/33CCFF/000000?text=Post+7"},
    {"id": 8, "title": "Starry Night", "imageUrl": "https://placehold.co/600x400/CCFF33/000000?text=Post+8"},
    {"id": 9, "title": "Riverside Relax", "imageUrl": "https://placehold.co/600x400/FF8D33/FFFFFF?text=Post+9"},
    {"id": 10, "title": "Historic Streets", "imageUrl": "https://placehold.co/600x400/8DFF33/000000?text=Post+10"},
    {"id": 11, "title": "Cloudy Day", "imageUrl": "https://placehold.co/600x400/33FF8D/FFFFFF?text=Post+11"},
    {"id": 12, "title": "Sunny Fields", "imageUrl": "https://placehold.co/600x400/FF338D/000000?text=Post+12"},
    {"id": 13, "title": "Rainy Window", "imageUrl": "https://placehold.co/600x400/8D33FF/FFFFFF?text=Post+13"},
    {"id": 14, "title": "Snowy Peaks", "imageUrl": "https://placehold.co/600x400/33FFCC/000000?text=Post+14"},
    {"id": 15, "title": "Autumn Leaves", "imageUrl": "https://placehold.co/600x400/FFCC33/000000?text=Post+15"},
]

def register_routes(app): # Define a function to register routes
    @app.route('/getpost/<int:pageno>', methods=['GET', 'OPTIONS'])
    @cross_origin()
    def getpost(pageno):
        posts_per_page = 5
        total_posts = len(sample_posts)
        total_pages = (total_posts + posts_per_page - 1) // posts_per_page

        if pageno < 1 or pageno > total_pages:
            return jsonify({"error": f"Invalid page number. Please request a page between 1 and {total_pages}."}), 400

        start_index = (pageno - 1) * posts_per_page
        end_index = start_index + posts_per_page

        paginated_posts = sample_posts[start_index:end_index]

        return jsonify({
            "posts": paginated_posts,
            "currentPage": pageno,
            "totalPages": total_pages,
            "totalPosts": total_posts
        })