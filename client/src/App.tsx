import { Switch, Route, useLocation, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Game from "@/pages/game";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Welcome from "@/pages/welcome";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "./lib/constants";

// Auth route wrapper to redirect unauthenticated users
function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();
  const [match] = useRoute("/");
  
  useEffect(() => {
    if (match) {
      const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (!userData) {
        navigate("/welcome");
      }
    }
  }, [match, navigate]);
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AuthRoute component={Game} />} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
