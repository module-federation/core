import React from 'react';
import { getCustomMDXComponent } from 'rspress/theme';

const { table, td, tr, th } = getCustomMDXComponent();

// usage
// <Table data={[
//   ['参数名称', '描述'],
//   ['remoteName', '生产者名称'],
//   ['remoteEntryUrl', '生产者入口地址'],
//   ['remoteEntryKey', '生产者全局挂载名称'],
// ]}/>
const Table = ({ data }: { data: Array<Array<string>> }) => {
  if (data.length < 2) {
    throw new Error('The data length is invalid!');
  }
  const Thead = () =>
    tr({
      children: [
        data[0].map((row, index) => {
          const Th = () =>
            th({
              children: row,
            });
          return <Th key={index} />;
        }),
      ],
    });

  const Tbody = () =>
    data.slice(1).map((row, index) => {
      const Tr = () =>
        tr({
          children: [
            row.map((h, index) => {
              const Td = () =>
                td({
                  children: h,
                });
              return <Td key={index} />;
            }),
          ],
        });
      return <Tr key={index} />;
    });

  const TableCom = table({
    children: [
      <thead key={'thead'}>
        <Thead key={'thead'} />
      </thead>,
      <tbody key={'tbody'}>
        <Tbody key={'tbody'} />
      </tbody>,
    ],
  });
  return <>{TableCom}</>;
};

export default Table;
