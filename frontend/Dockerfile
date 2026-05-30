# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# OCI Labels for metadata
LABEL org.opencontainers.image.title="Frontend Application" \
      org.opencontainers.image.description="Production build for the frontend UI" \
      org.opencontainers.image.version="1.0.0"

COPY package.json package-lock.json* ./

# Utilize BuildKit cache to speed up npm installs across subsequent builds
RUN --mount=type=cache,target=/root/.npm npm ci --silent

COPY . .

# Build the production bundle
RUN npm run build

# ── Stage 2: Serve with Nginx ──
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# --- SECURITY: Configure Nginx to run as a non-root user ---
# Nginx needs permissions to write to its cache and pid files when not running as root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to the non-root 'nginx' user
USER nginx

# --- RESILIENCE: Container Healthcheck ---
# Checks every 30s if the server responds, failing after 3s if it doesn't
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
