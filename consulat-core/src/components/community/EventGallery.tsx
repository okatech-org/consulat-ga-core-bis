import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Calendar, MapPin } from "lucide-react";

import event1 from "@/assets/events/event-1.jpg";
import event2 from "@/assets/events/event-2.jpg";
import event3 from "@/assets/events/event-3.jpg";
import event4 from "@/assets/events/event-4.jpg";
import event5 from "@/assets/events/event-5.jpg";
import event6 from "@/assets/events/event-6.jpg";

interface GalleryEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
}

const pastEvents: GalleryEvent[] = [
  {
    id: 1,
    title: "Soirée de la Diaspora",
    date: "15 Décembre 2023",
    location: "Paris, France",
    image: event1,
    category: "Célébration"
  },
  {
    id: 2,
    title: "Festival Culturel Gabonais",
    date: "23 Novembre 2023",
    location: "Lyon, France",
    image: event2,
    category: "Culture"
  },
  {
    id: 3,
    title: "Réception Diplomatique",
    date: "10 Octobre 2023",
    location: "Ambassade du Gabon, Bruxelles",
    image: event3,
    category: "Diplomatie"
  },
  {
    id: 4,
    title: "Gala de Charité Annuel",
    date: "5 Septembre 2023",
    location: "Genève, Suisse",
    image: event4,
    category: "Charité"
  },
  {
    id: 5,
    title: "Fête de l'Indépendance",
    date: "17 Août 2023",
    location: "Consulat Général, Marseille",
    image: event5,
    category: "National"
  },
  {
    id: 6,
    title: "Tournoi de Football Diaspora",
    date: "20 Juillet 2023",
    location: "Bordeaux, France",
    image: event6,
    category: "Sport"
  }
];

export function EventGallery() {
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (event: GalleryEvent, index: number) => {
    setSelectedEvent(event);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedEvent(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? pastEvents.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedEvent(pastEvents[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === pastEvents.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedEvent(pastEvents[newIndex]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {pastEvents.map((event, index) => (
          <motion.div
            key={event.id}
            variants={itemVariants}
            className="group cursor-pointer"
            onClick={() => openLightbox(event, index)}
          >
            <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-muted">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-xs bg-primary/90 text-primary-foreground px-2 py-1 rounded-full w-fit mb-2">
                  {event.category}
                </span>
                <h4 className="text-white font-bold text-lg">{event.title}</h4>
                <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {event.date}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
          <AnimatePresence mode="wait">
            {selectedEvent && (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                
                {/* Event Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    {selectedEvent.category}
                  </span>
                  <h3 className="text-white text-2xl font-bold mt-2">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm mt-2">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {selectedEvent.date}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                  onClick={closeLightbox}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Image Counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {pastEvents.length}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}