module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {
        packageImportPath:
          'import com.modulefederation.metrocache.MFECachePackage;',
        packageInstance: 'new MFECachePackage()',
      },
    },
  },
};
