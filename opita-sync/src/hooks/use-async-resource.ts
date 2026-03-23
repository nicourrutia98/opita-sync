import { useCallback, useEffect, useState } from "react";
import { isServiceError } from "../services/errors";

type AsyncStatus = "loading" | "ready" | "empty" | "error";

interface AsyncResourceState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  errorCode: string | null;
  errorStatus: number | null;
  retry: () => void;
}

interface AsyncResourceOptions {
  enabled?: boolean;
}

function isEmptyValue<T>(value: T): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

export function useAsyncResource<T>(loader: () => Promise<T>, deps: unknown[], options: AsyncResourceOptions = {}): AsyncResourceState<T> {
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState<AsyncStatus>(options.enabled === false ? "empty" : "loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (options.enabled === false) {
      setStatus("empty");
      setError(null);
      setErrorCode(null);
      setErrorStatus(null);
      return;
    }

    let isActive = true;
    setStatus("loading");
    setError(null);
    setErrorCode(null);
    setErrorStatus(null);

    loader()
      .then((result) => {
        if (!isActive) {
          return;
        }
        setData(result);
        setStatus(isEmptyValue(result) ? "empty" : "ready");
      })
      .catch((reason: unknown) => {
        if (!isActive) {
          return;
        }
        if (isServiceError(reason)) {
          setError(reason.message);
          setErrorCode(reason.code);
          setErrorStatus(reason.status ?? null);
        } else {
          setError(reason instanceof Error ? reason.message : "Unexpected error");
          setErrorCode(null);
          setErrorStatus(null);
        }
        setStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, [loader, reloadKey, options.enabled, ...deps]);

  return { status, data, error, errorCode, errorStatus, retry };
}
