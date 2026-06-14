import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Browse } from "@/pages/Browse";
import { Comments } from "@/pages/Comments";
import { Compare } from "@/pages/Compare";
import { Delivery } from "@/pages/Delivery";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/delivery" element={<Delivery />} />
        </Route>
      </Routes>
    </Router>
  );
}
