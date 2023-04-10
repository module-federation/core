//@ts-ignore
import Page from 'checkout/pages/checkout/index';

// the data loading method needs to be here so next can static analyze it properly.
Page.getInitialProps = Page.getInitialProps

export default Page;
