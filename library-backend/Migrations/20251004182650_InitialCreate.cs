using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LibraryProject.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Author = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Date = table.Column<string>(type: "TEXT", maxLength: 4, nullable: false),
                    Genre = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "Id", "Author", "Date", "Genre", "Title" },
                values: new object[,]
                {
                    { 1, "George Orwell", "1949", "Dystopian", "1984" },
                    { 2, "Harper Lee", "1960", "Fiction", "To Kill a Mockingbird" },
                    { 3, "F. Scott Fitzgerald", "1925", "Classic", "The Great Gatsby" },
                    { 4, "Herman Melville", "1851", "Adventure", "Moby Dick" },
                    { 5, "Jane Austen", "1813", "Romance", "Pride and Prejudice" },
                    { 6, "Leo Tolstoy", "1869", "Historical", "War and Peace" },
                    { 7, "J.D. Salinger", "1951", "Fiction", "The Catcher in the Rye" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Books");
        }
    }
}
