type StoryContext = {
  title: string;
};

export const parameters = {
  docs: {
    source: {
      type: 'dynamic',
    },
    transformSource: (source: string, { title }: StoryContext) => {
      // With source dynamic and exclude decorators the output of component is "[object Object]"
      // Workaround to replace with component name.
      const match = '[object Object]';
      if (source.indexOf(match) !== -1) {
        const fullComponentPath = title.split('/');
        const componentName = fullComponentPath[fullComponentPath.length - 1];
        return source.replaceAll(match, componentName);
      }

      return source;
    },
  },
};
