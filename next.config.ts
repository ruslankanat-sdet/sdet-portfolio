import type { NextConfig } from 'next';
import path from 'path';
import createMDX from '@next/mdx';

const withMDX = createMDX({
  // No remark/rehype plugins needed in Phase 2
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // Silence workspace root detection warning when there are multiple lockfiles
  outputFileTracingRoot: path.join(__dirname),
};

export default withMDX(nextConfig);
