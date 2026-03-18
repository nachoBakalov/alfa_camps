import { Outlet } from 'react-router-dom';
import { PublicContainer } from './PublicContainer';
import { PublicTopBar } from './PublicTopBar';

export function PublicLayout() {
  return (
    <div className="public-theme">
      <PublicTopBar />
      <main className="py-5 sm:py-8">
        <PublicContainer>
          <Outlet />
        </PublicContainer>
      </main>
    </div>
  );
}
