using Microsoft.EntityFrameworkCore;
using Library.Models;

namespace Library.Data
{
    public class LibraryDbContext : DbContext
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Book>().ToTable("Books");
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Book>().HasData(
                new Book { Id = 1, Title = "1984", Author = "George Orwell", Date = "1949", Genre = "Dystopian" },
                new Book { Id = 2, Title = "To Kill a Mockingbird", Author = "Harper Lee", Date = "1960", Genre = "Fiction" },
                new Book { Id = 3, Title = "The Great Gatsby", Author = "F. Scott Fitzgerald", Date = "1925", Genre = "Classic" },
                new Book { Id = 4, Title = "Moby Dick", Author = "Herman Melville", Date = "1851", Genre = "Adventure" },
                new Book { Id = 5, Title = "Pride and Prejudice", Author = "Jane Austen", Date = "1813", Genre = "Romance" },
                new Book { Id = 6, Title = "War and Peace", Author = "Leo Tolstoy", Date = "1869", Genre = "Historical" },
                new Book { Id = 7, Title = "The Catcher in the Rye", Author = "J.D. Salinger", Date = "1951", Genre = "Fiction" }
            );
        }
    }
}