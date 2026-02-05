import { Download, Search, BookOpen } from 'lucide-react';
import { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

export default function Books() {
  const baseBooks = [
    {
      title: 'Book of Fasting',
      file: '/books/book-of-fasting.pdf',
      description: "A translation of a small pocket-size booklet written by Shaikh Usaamah Al-Qoosee, which was given the title 'As-Siyaam wa Ahkaamuhu' (Fasting and Its Rulings).",
      pages: 32
    },
    {
      title: "Ramadhan: Let's avoid the losses",
      file: "/books/ramadhan-avoid-losses.pdf",
      description: 'A book on the avoidance of loosing the Blessings of Ramadan.',
      pages: 40
    },
    {
      title: 'A Guide For Ramadhan',
      file: '/books/a-guide-for-ramadhan.pdf',
      description: "A mini guide to help those who may be confused about what to do to make their Ramadhan productive.",
      pages: 21
    },
    {
      title: 'Kitab Us-Sawm',
      file: '/books/kitaabus-sawm.pdf',
      description: "Kitab Us-Sawm (The book of fasting) is a book Compiled by Mujlisul Ulama (PE)",
      pages: 47
    },
    {
      title: 'Causes Behind The Increase and Decrease of Eemaan',
      file: '/books/causes-of-eemaan.pdf',
      description: "An explanation and clarification of the most important causes for the increase and decrease of eemaan.",
      pages: 164
    },
    {
      title: 'Islamic Fundamentals (Zakat and Sawm)',
      file: '/books/islamic-fundamentals-zakat-and-sawm-hints-the-principles-economic-system-in-islam.pdf',
      description: "An indispensable handbook for students of Islamic Studies at various level of learning.",
      pages: 66
    },
    {
      title: "Bulugh Al Maram Fee Adilatil Ahkaam",
      file: "/books/bulugh-al-maram.pdf",
      description: "Bulugh Al-Maram is a book which was written by Imam Ibn Hajar(773H - 852H) with the objective of compiling many of the Ahadith particularly related to the Ahkam(Judgements) of the islamic Shari'ah.",
      pages: 576
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const filteredBooks = baseBooks.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()
    )
  );

  const BookCard = ({ book }) => {
    const [mainTitle, subTitle] = book.title.split(' - ');
    const tags = [subTitle].filter(Boolean);

    const openBook = async (url) => {
      import('@capacitor/browser').then(async ({ Browser }) => {
        await Browser.open({ url });
      }).catch(() => {
        window.open(url, '_blank');
      });
    };

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {mainTitle}
            </h3>
            {book.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
            )}
          </div>
        </div>

        <div className="mt-auto">
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
            <button
              onClick={() => openBook(book.file)}
              className="flex-1 text-sm px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen size={16} />
              Read
            </button>
            <a
              href={book.file}
              download
              className="flex-1 text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  };

  const { currentUser } = useAuth();

  const content = (
    <div className={`${currentUser ? '' : 'max-w-7xl mx-auto md:pt-15 pt-12 pb-8 px-4 mt-5'}`}>
      <div className="text-center mb-12">
        <SectionHeader
          title="Library"
          subtitle="Explore a curated collection of essential Islamic books on fasting. Read online or download for offline access."
        />
      </div>

      <div className="mb-12">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search books by title..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, i) => <BookCard key={i} book={book} />)
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No books found
            </h3>
            <p className="text-gray-600 mb-6 font-medium">
              We couldn't find any books matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {searchTerm && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Other Books
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baseBooks
              .filter((book) => !filteredBooks.includes(book))
              .map((book, i) => (
                <BookCard key={i} book={book} />
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return currentUser ? <DashboardLayout>{content}</DashboardLayout> : content;
}
