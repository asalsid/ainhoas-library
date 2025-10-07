using Microsoft.EntityFrameworkCore;
using Library.Data;
using Library.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Add request logging to help debug CORS issues
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path} from {context.Request.Headers.Origin}");
    await next();
    Console.WriteLine($"Response: {context.Response.StatusCode}");
});

// Use CORS policy for development
app.UseCors("AllowAll");

app.MapGet("/books", async (LibraryDbContext db) =>
    await db.Books.ToListAsync());

// API info endpoint
app.MapGet("/", () => 
{
    return Results.Ok(new
    {
        message = "Library Backend API",
        version = "1.0",
        endpoints = new
        {
            books = "GET /books",
            bookById = "GET /books/{id}",
            createBook = "POST /books",
            updateBook = "PUT /books/{id}",
            deleteBook = "DELETE /books/{id}",
            events = "GET /books/events (Server-Sent Events)",
            health = "GET /health"
        }
    });
});

// Health check endpoint
app.MapGet("/health", async (LibraryDbContext db) =>
{
    try
    {
        await db.Database.CanConnectAsync();
        var bookCount = await db.Books.CountAsync();
        return Results.Ok(new 
        { 
            status = "healthy", 
            database = "connected", 
            bookCount = bookCount,
            timestamp = DateTime.UtcNow 
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database connection failed: {ex.Message}");
    }
});

app.MapGet("/books/events", async (HttpContext context, IServiceScopeFactory scopeFactory, CancellationToken cancellationToken) =>
{
    context.Response.Headers["Content-Type"] = "text/event-stream";
    context.Response.Headers["Cache-Control"] = "no-cache";
    context.Response.Headers["Connection"] = "keep-alive";

    try
    {
        // Send initial data using a scoped DbContext
        using (var scope = scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
            var initialBooks = await db.Books.ToListAsync(cancellationToken);
            var initialData = System.Text.Json.JsonSerializer.Serialize(initialBooks);
            await context.Response.WriteAsync($"data: {initialData}\n\n", cancellationToken);
            await context.Response.Body.FlushAsync(cancellationToken);
        }

        var lastBookCount = 0;
        using (var scope = scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
            lastBookCount = await db.Books.CountAsync(cancellationToken);
        }
        
        while (!cancellationToken.IsCancellationRequested)
        {
            await Task.Delay(2000, cancellationToken);
            
            // Use a new scope for each database operation
            using (var scope = scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
                var currentBookCount = await db.Books.CountAsync(cancellationToken);
                
                // Send update if book count changed
                if (currentBookCount != lastBookCount)
                {
                    var currentBooks = await db.Books.ToListAsync(cancellationToken);
                    
                    // Send just the books array (Angular expects this format)
                    var jsonData = System.Text.Json.JsonSerializer.Serialize(currentBooks);
                    await context.Response.WriteAsync($"data: {jsonData}\n\n", cancellationToken);
                    await context.Response.Body.FlushAsync(cancellationToken);
                    
                    lastBookCount = currentBookCount;
                    Console.WriteLine($"SSE: Sent {currentBooks.Count} books to Angular frontend");
                }
            }
        }
    }
    catch (OperationCanceledException)
    {
        // Client disconnected, this is normal
        Console.WriteLine("SSE: Angular client disconnected");
    }
    catch (Exception ex)
    {
        // Log error properly
        Console.WriteLine($"SSE Error: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        
        try
        {
            await context.Response.WriteAsync($"event: error\n", cancellationToken);
            await context.Response.WriteAsync($"data: {{\"error\": \"{ex.Message}\", \"timestamp\": \"{DateTime.UtcNow:O}\"}}\n\n", cancellationToken);
            await context.Response.Body.FlushAsync(cancellationToken);
        }
        catch
        {
            // If we can't write the error, just log it
            Console.WriteLine("Failed to send error message to Angular client");
        }
    }
});

app.MapGet("/books/{id}", async (int id, LibraryDbContext db) =>
    await db.Books.FindAsync(id)
        is Book book
            ? Results.Ok(book)
            : Results.NotFound());

app.MapPost("/books", async (Book book, LibraryDbContext db) =>
{
    db.Books.Add(book);
    await db.SaveChangesAsync();

    return Results.Created($"/books/{book.Id}", book);
});

app.MapPut("/books/{id}", async (int id, Book updatedBook, LibraryDbContext db) =>
{
    var book = await db.Books.FindAsync(id);

    if (book is null) return Results.NotFound();

    book.Title = updatedBook.Title;
    book.Author = updatedBook.Author;
    book.Date = updatedBook.Date;
    book.Genre = updatedBook.Genre;

    await db.SaveChangesAsync();

    return Results.Ok(book);
});

app.MapDelete("/books/{id}", async (int id, LibraryDbContext db) =>
{
    var book = await db.Books.FindAsync(id);

    if (book is null) return Results.NotFound();

    db.Books.Remove(book);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();