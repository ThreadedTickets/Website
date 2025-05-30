export default function ErrorPage({ message }: { message: string }) {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
