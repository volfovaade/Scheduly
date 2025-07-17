using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventPlanner.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Events",
                newName: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_OptionId",
                table: "Votes",
                column: "OptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_UserId",
                table: "Votes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_EventOptions_OptionId",
                table: "Votes",
                column: "OptionId",
                principalTable: "EventOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Users_UserId",
                table: "Votes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Votes_EventOptions_OptionId",
                table: "Votes");

            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Users_UserId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Votes_OptionId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Votes_UserId",
                table: "Votes");

            migrationBuilder.RenameColumn(
                name: "OwnerId",
                table: "Events",
                newName: "CreatedBy");
        }
    }
}
