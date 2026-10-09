import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Assignment 1 management pages moved into the protected /admin area.
  async redirects() {
    return [
      { source: "/departments/manage", destination: "/admin/departments", permanent: false },
      { source: "/projects/manage", destination: "/admin/projects", permanent: false },
      { source: "/tasks/manage", destination: "/admin/tasks", permanent: false },
      { source: "/tags/manage", destination: "/admin/tags", permanent: false },
    ];
  },
};

export default nextConfig;
