import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useProjectStore } from "../../store/useProjectStore";

export function Lightbox() {
  const { lightboxImage, closeLightbox } = useProjectStore();
  const { designGroups, activeGroupId, activeDesignId, setActiveDesign } =
    useProjectStore();

  const activeGroup = designGroups.find((g) => g.id === activeGroupId);
  const designs = activeGroup?.designs || [];
  const currentIndex = designs.findIndex((d) => d.id === activeDesignId);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevDesign = designs[currentIndex - 1];
      setActiveDesign(prevDesign.id);
    }
  }, [currentIndex, designs, setActiveDesign]);

  const goToNext = useCallback(() => {
    if (currentIndex < designs.length - 1) {
      const nextDesign = designs[currentIndex + 1];
      setActiveDesign(nextDesign.id);
    }
  }, [currentIndex, designs, setActiveDesign]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, closeLightbox, goToPrev, goToNext]);

  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  return (
    <AnimatePresence>
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-brand-charcoal/95 flex items-center justify-center"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {currentIndex < designs.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/60 text-sm">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="font-mono">100%</span>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <ZoomIn size={16} />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-6xl max-h-[85vh] px-20"
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <p className="text-center text-white/60 mt-4 font-mono text-sm">
              {lightboxImage.title} · {currentIndex + 1} / {designs.length}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
