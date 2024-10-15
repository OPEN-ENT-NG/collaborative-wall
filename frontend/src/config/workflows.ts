export const workflows = {
  view: 'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|view',
  list: 'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|list',
  create:
    'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|create',
  publish:
    'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|publish',
  print:
    'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|print',
};

export const rights = {
  read: {
    right:
      'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieve',
  },
  contrib: {
    right:
      'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|update',
  },
  manage: {
    right:
      'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|delete',
  },
};
