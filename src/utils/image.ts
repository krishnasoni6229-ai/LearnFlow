const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
  laptops: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
  fragrances: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop',
  skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
};

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop';

export function getCourseImage(course: { category?: string; images?: string[]; thumbnail?: string }): string {
  const imgUrl = course.images?.[0] || course.thumbnail;
  if (!imgUrl || imgUrl.includes('dummyjson.com') || imgUrl.includes('placeholder')) {
    const cat = (course.category || '').toLowerCase();
    return CATEGORY_PLACEHOLDERS[cat] || DEFAULT_PLACEHOLDER;
  }
  return imgUrl;
}

export function getFallbackImageForCategory(category?: string): string {
  const cat = (category || '').toLowerCase();
  return CATEGORY_PLACEHOLDERS[cat] || DEFAULT_PLACEHOLDER;
}
