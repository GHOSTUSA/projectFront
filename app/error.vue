<!-- Page Vue - Gestion des erreurs et codes de statut -->
<script setup lang="ts">
interface ErrorProps {
  error: {
    statusCode: number;
    statusMessage?: string;
    message?: string;
  };
}

const props = defineProps<ErrorProps>();
const { t } = useI18n();

const getErrorTitle = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return t("errors.pages.400.title");
    case 401:
      return t("errors.pages.401.title");
    case 403:
      return t("errors.pages.403.title");
    case 404:
      return t("errors.pages.404.title");
    case 500:
      return t("errors.pages.500.title");
    case 503:
      return t("errors.pages.503.title");
    default:
      return t("errors.pages.default.title");
  }
};

const getErrorDescription = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return t("errors.pages.400.description");
    case 401:
      return t("errors.pages.401.description");
    case 403:
      return t("errors.pages.403.description");
    case 404:
      return t("errors.pages.404.description");
    case 500:
      return t("errors.pages.500.description");
    case 503:
      return t("errors.pages.503.description");
    default:
      return t("errors.pages.default.description");
  }
};

const goHome = () => {
  navigateTo("/");
};
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-content">
        <h1 class="error-code">{{ props.error.statusCode }}</h1>
        <h2 class="error-title">{{ getErrorTitle(props.error.statusCode) }}</h2>

        <p class="error-message">
          {{
            props.error.statusMessage ||
            getErrorDescription(props.error.statusCode)
          }}
        </p>

        <div class="error-actions">
          <button @click="goHome" class="btn btn-primary">
            {{ t("errors.pages.actions.goHome") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(1deg, #000000 0%, #552929 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.error-container {
  background: rgba(255, 255, 255, 0.305);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  box-shadow: inset 0 0px 5px rgba(0, 0, 0, 1);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 72px;
  font-weight: 900;
  color: #dc3545;
  margin: 0 0 16px 0;
  line-height: 1;
}

.error-title {
  font-size: 28px;
  font-weight: 700;
  color: #343a40;
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #717171, #ffffff);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(40, 40, 41, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .error-container {
    padding: 32px 24px;
  }

  .error-code {
    font-size: 56px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-icon {
    font-size: 64px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
