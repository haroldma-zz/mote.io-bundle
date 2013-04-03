// actual client code
window.moteio_config =
{
  api_version: '0.1',
  app_name: 'Press Button to Sync.',
  blocks: [
    {
      type: 'buttons',
      data: [
        {
          press: function () {
            return false;
          },
          icon: 'refresh'
        }
      ]
    }
  ]
}
