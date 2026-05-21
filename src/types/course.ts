export interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface RawUser {
  id: number;
  gender: string;
  name: { title: string; first: string; last: string };
  email: string;
  login: { uuid: string; username: string };
  dob: { date: string; age: number };
  picture: { large: string; medium: string; thumbnail: string };
  location: {
    city: string;
    state: string;
    country: string;
  };
  nat: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number;
  data: T[];
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface CourseInstructor {
  id: number;
  name: string;
  avatar: string;
  country: string;
  username: string;
}

export interface CourseItem {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  images: string[];
  category: string;
  level: string;
  duration: string;
  studentsCount: number;
  instructor: CourseInstructor;
}

const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DURATIONS = ['4h 30m', '8h 15m', '12h', '6h 45m', '10h 20m', '15h', '3h 50m', '20h', '7h', '5h 30m'];
const STUDENT_COUNTS = [1240, 3890, 780, 5620, 2100, 9430, 450, 7200, 3300, 1870];

export function mergeCourses(products: RawProduct[], users: RawUser[]): CourseItem[] {
  return products.map((product, index) => {
    const user = users[index % users.length];
    const discounted = product.price * (1 - product.discountPercentage / 100);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: Math.round(discounted),
      originalPrice: product.price,
      rating: product.rating,
      reviewCount: product.stock * 12,
      thumbnail: product.thumbnail,
      images: product.images,
      category: product.category,
      level: COURSE_LEVELS[index % COURSE_LEVELS.length],
      duration: DURATIONS[index % DURATIONS.length],
      studentsCount: STUDENT_COUNTS[index % STUDENT_COUNTS.length],
      instructor: {
        id: user.id,
        name: `${user.name.first} ${user.name.last}`,
        avatar: user.picture.medium,
        country: user.location.country,
        username: user.login.username,
      },
    };
  });
}
