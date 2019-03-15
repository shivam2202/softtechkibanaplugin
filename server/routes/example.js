export default function (server) {

  server.route({
    path: '/api/flexmonster_plugin/example',
    method: 'GET',
    handler(req, reply) {
      reply({ time: (new Date()).toISOString() });
    }
  });

}
