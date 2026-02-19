import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Home } from "@/pages/public/Home";
import { Movies } from "@/pages/public/Movies";
import { Writing } from "@/pages/public/Writing";
import { Links } from "@/pages/public/Links";
import { About } from "@/pages/public/About";
import { NotFound } from "@/pages/NotFound";

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/links" element={<Links />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
