// models/Author.js
import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dataDiNascita: { type: String, required: true },
  avatar: { type: String, default: "" },
  password: { type: String, required: true, select: false }
}, {
  timestamps: true
});

const Author = mongoose.model("Author", AuthorSchema);
export default Author;
