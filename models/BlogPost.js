import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  cover: { type: String, required: true },
  readTime: {
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  content: { type: String, required: true },


  comments: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      text: { type: String, required: true },
      user: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
export default BlogPost;

