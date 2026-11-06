window.config = {
  routerBasename: "/",
  showStudyList: false,
  extensions: [],
  modes: [],
  dataSources: [
    {
      namespace: "@ohif/extension-default.dataSourcesModule.dicomweb",
      sourceName: "gpaDicomweb",
      configuration: {
        friendlyName: "GPA Imaging Lab",
        name: "GPA Orthanc",
        qidoRoot: "/dicomweb",
        wadoRoot: "/dicomweb",
        wadoUriRoot: "/dicomweb",
        qidoSupportsIncludeField: false,
        imageRendering: "wadors",
        thumbnailRendering: "wadors",
        enableStudyLazyLoad: true,
        supportsWildcard: false,
        supportsFuzzyMatching: false,
        requestOptions: { withCredentials: true },
      },
    },
  ],
  defaultDataSourceName: "gpaDicomweb",
};
