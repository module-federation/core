import { useEffect, useState } from 'react';
import { useI18n } from '../../theme/i18n';
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';

export default function AnnouncementVideo(props: {
  customWidthScale?: number;
}) {
  const t = useI18n();

  useEffect(() => {
    setTimeout(() => {
      new Player({
        id: 'mse-video',
        url: t('announcementVideo'),
        height: '100%',
        width: '100%',
        poster: t('announcementVideoPoster'),
      });
    }, 500);
  });

  function calculatescale(width: number) {
    let customWidthScale = props.customWidthScale;
    if (!props.customWidthScale) {
      customWidthScale = 0.3;
    }
    return {
      width: width - width * customWidthScale,
      height: (width - width * customWidthScale) * 0.5625,
    };
  }

  const [divWidth, setDivWidth] = useState(window.innerWidth);

  // 更新宽度的函数
  const updateWidth = () => {
    setDivWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <div
      className="mx-auto"
      style={{
        width: `${calculatescale(divWidth).width}px`,
        height: `${calculatescale(divWidth).height}px`,
      }}
    >
      <div id="mse-video"></div>
    </div>
  );
}
