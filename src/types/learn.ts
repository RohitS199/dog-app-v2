// Learn tab types — article library backed by blog_articles table

export interface Article {
  slug: string;              // routing key + React list key (NOT uuid)
  title: string;
  summary: string;
  body: string;              // raw Markdown
  section: string;           // section slug
  readTimeMinutes: number;   // mapped from read_time_minutes
  imageUrl: string | null;   // mapped from image_url
  sortOrder: number;         // mapped from sort_order
  publishedAt: string | null; // mapped from published_at
}

export interface Section {
  id: string;                // section slug
  title: string;
  description: string;
  icon: string;              // MaterialCommunityIcons name
  accentColor: string;
  articles: Article[];
}
