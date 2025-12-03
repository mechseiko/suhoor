import { Download, Search, BookOpen } from 'lucide-react';
import { useState } from 'react';

const baseBooks = [
  {
    title: 'Book of Fasting',
    file: '/books/Book of Fasting.pdf',
  },
  {
    title: 'Book of Fasting',
    file: '/books/Book of Fasting.pdf',
  },
  {
    title: 'Book of Fasting',
    file: '/books/Book of Fasting.pdf',
  },
];

export default function Books() {
    

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = baseBooks.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actionClass =
    'w-fit mt-2 text-sm px-3 py-1 gap-2 flex items-center bg-muted text-primary rounded hover:bg-primary hover:text-light';

  const BookCard = ({ book }) => {
    const [mainTitle, subTitle] = book.title.split(' - ');
    const tags = [subTitle].filter(Boolean);

    return (
      <div className="rounded-lg bg-primary/85 flex flex-col justify-between py-4 px-3 hover:shadow-sm hover:scale-y-110 transition">
        <h2 className="md:text-xl text-lg text-light font-semibold mb-5">
          {mainTitle}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs font-light px-3 py-1 text-primary bg-muted/85 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <a href={book.file} className={actionClass} target="_blank">
            <BookOpen size={16} />
            Read
          </a>
          <a href={book.file} download className={actionClass}>
            <Download size={16} />
            Download
          </a>
        </div>
      </div>
    );
  };

  const BookGrid = ({ books }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
      {books.map((book, i) => (
        <BookCard key={i} book={book} />
      ))}
    </div>
  );

  return (
    <div>

   
      <div className="border-1 rounded-md border-primary flex items-center pl-3 gap-3 md:w-3/4 w-full h-10 hover:border-[1.5px]">
        <Search />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search books"
          className="outline-none w-full"
        />
      </div>

      {filteredBooks.length > 0 ? (
        <>
          <BookGrid books={filteredBooks} />
          <BookGrid
            books={baseBooks.filter((book) => !filteredBooks.includes(book))}
          />
        </>
      ) : (
        <>
          <div className="text-lg text-primary mt-3">
            Oops, "{searchTerm}" was not found.
          </div>
          <BookGrid books={baseBooks} />
        </>
        
      )}
       </div>
  );
};
