INSERT INTO worlds (name, display_name, description, icon_url, character_image_url, theme_color, sort_order, is_active)
VALUES
  ('medieval', 'Mundo Medieval', 'Adéntrate en el castillo encantado', '/worlds/medieval-castle.png', '/pj/medieval-pj.png', '#a855f7', 1, true),
  ('agua', 'Mundo Agua', 'Sumérgete en las profundidades del océano', '/worlds/agua.png', '/pj/octopus-pj.png', '#0ea5e9', 2, true),
  ('bosque', 'Mundo Bosque', 'Explora la naturaleza salvaje del bosque', '/worlds/bosque.png', '/pj/aligator-pj.png', '#22c55e', 3, true),
  ('hielo', 'Mundo Hielo', 'Conquista el frío del Ártico', '/worlds/hielo.png', '/pj/penguin-pj.png', '#67e8f9', 4, true),
  ('fuego', 'Mundo Fuego', 'Enfrenta el calor de los volcanes', '/worlds/fuego.png', '/pj/dragon-pj.png', '#ef4444', 5, true),
  ('cielo', 'Mundo Cielo', 'Vuela alto entre las nubes', '/worlds/cielo.png', '/pj/phoenix.png', '#38bdf8', 6, true)
ON CONFLICT (name) DO NOTHING;
