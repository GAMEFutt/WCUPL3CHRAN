import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Home from '@/pages/Home';
import Matches from '@/pages/Matches';
import Predict from '@/pages/Predict';
import Results from '@/pages/Results';
import Leaderboard from '@/pages/Leaderboard';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/matches" component={Matches} />
      <Route path="/predict" component={Predict} />
      <Route path="/results" component={Results} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}
