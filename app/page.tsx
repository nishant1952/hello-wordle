import Game from '../components/game';

export default function Home() {
  return (
  <main className="flex min-h-screen items-center justify-center">
  <div className="container">
    <Game rows={6} columns={5} />
  </div>
</main>

  );
}
