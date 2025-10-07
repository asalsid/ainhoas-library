using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Library.Models
{
    public class Book
    {
        [Key]
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [Required]
        [MaxLength(30)]
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        [Required]
        [MaxLength(30)]
        [JsonPropertyName("author")]
        public string Author { get; set; } = string.Empty;
        [Required]
        [MaxLength(4)]
        [JsonPropertyName("year")]
        public string Date { get; set; } = string.Empty;
        [MaxLength(30)]
        [JsonPropertyName("genre")]
        public string Genre { get; set; } = string.Empty;
    }
}