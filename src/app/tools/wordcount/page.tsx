import { Metadata } from "next";
import WordCounter from "@/components/tools/WordCounter";

export const metadata: Metadata = {
  title: "Word & Character Counter — ShipLocal",
  description:
    "Count words, characters, sentences, paragraphs, and estimate reading time — all in your browser.",
};

export default function WordCountPage() {
  return <WordCounter />;
}
