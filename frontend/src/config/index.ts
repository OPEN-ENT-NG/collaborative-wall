export const workflows = {
  view: "net.atos.entng.mindmap.controllers.MindmapController|view",
  list: "net.atos.entng.mindmap.controllers.MindmapController|list",
  create: "net.atos.entng.mindmap.controllers.MindmapController|create",
  publish: "net.atos.entng.mindmap.controllers.MindmapController|publish",
  exportpng:
    "net.atos.entng.mindmap.controllers.MindmapController|exportPngMindmap",
  exportsvg:
    "net.atos.entng.mindmap.controllers.MindmapController|exportSvgMindmap",
};

export const rights = {
  read: {
    right:
      "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieve",
  },
  contrib: {
    right:
      "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|update",
  },
  manage: {
    right:
      "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|delete",
  },
};
