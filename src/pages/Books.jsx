import { Download, Search, BookOpen, Library } from 'lucide-react';
import { useState } from 'react';
import PageLayout from '../layouts/PageLayout';

const baseBooks = [
  {
    title: 'Book of Fasting',
    file: '/books/Book of Fasting.pdf',
    description: 'Comprehensive guide to fasting in Islam',
    pages: '120'
  },
];

export default function Books() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = baseBooks.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BookCard = ({ book }) => {
    const [mainTitle, subTitle] = book.title.split(' - ');
    const tags = [subTitle].filter(Boolean);

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mainTitle}
            </h3>
            {book.description && (
              <p className="text-sm text-gray-600 mb-3">{book.description}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {book.pages && (
              <p className="text-xs text-gray-500 mb-3">{book.pages} pages</p>
            )}
            <div className="flex gap-2">
              <a
                href={book.file}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen size={16} />
                Read
              </a>
              <a
                href={book.file}
                download
                className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
            <Library className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Islamic Books Library
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our collection of Islamic books and resources
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books by title..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Books Grid */}
        <div className="space-y-4">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book, i) => <BookCard key={i} book={book} />)
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No books found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any books matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Show all books if searching */}
        {searchTerm && filteredBooks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Other Books
            </h2>
            <div className="space-y-4">
              {baseBooks
                .filter((book) => !filteredBooks.includes(book))
                .map((book, i) => (
                  <BookCard key={i} book={book} />
                ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
