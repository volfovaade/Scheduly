export default function DemoNotice() {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: "#fff3cd",
        color: "#664d03",
        borderBottom: "1px solid #ffecb5",
        padding: "10px 16px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      ⚠️ Backend a databáze nejsou aktuálně
      připojeny, proto není dočasně možné vytvářet ani ukládat žádné akce.
    </div>
  );
}
