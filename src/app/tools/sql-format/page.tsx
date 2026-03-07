import { Metadata } from "next";
import SQLFormatter from "@/components/tools/SQLFormatter";

export const metadata: Metadata = {
  title: "SQL Formatter — BrowserShip",
  description:
    "Format, beautify, and minify SQL queries with dialect support for PostgreSQL, MySQL, SQLite, and BigQuery. All processing happens locally in your browser.",
};

export default function SQLFormatPage() {
  return <SQLFormatter />;
}
