import './styles.css';

const SkeletonCard = () => (
  <div className="skeleton">
    <div className="skeleton-img" />
    <div className="skeleton-btn" />
    <div className="skeleton-line-one" />
    <div className="skeleton-line-two" />
  </div>
);

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-400/80">
        Styled with a Global CSS Stylesheet
      </h1>
      <div className="container">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
