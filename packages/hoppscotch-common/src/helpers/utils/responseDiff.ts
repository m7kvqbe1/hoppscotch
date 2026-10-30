import type { HoppRESTResponse } from "~/helpers/types/HoppRESTResponse"
import { getResponseBodyText } from "~/composables/lens-actions"

type HoppRESTComparableResponse = Extract<
  HoppRESTResponse,
  { type: "success" | "fail" }
>

/**
 * Whether a response carries a status, headers and a body, so it can be
 * compared against another run of the same request
 */
export const isComparableResponse = (
  response: HoppRESTResponse | null | undefined
): response is HoppRESTComparableResponse =>
  response?.type === "success" || response?.type === "fail"

const formatBody = (body: ArrayBuffer | string) => {
  const text = getResponseBodyText(body)

  // Pretty print JSON so a change to one field shows as one changed line
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

/**
 * Renders a response as plain text (status line, headers, blank line, body)
 * for a side by side diff of two runs of the same request
 */
export const getResponseDiffText = (
  response: HoppRESTComparableResponse
): string => {
  const statusLine = `${response.statusCode} ${response.statusText}`.trim()
  const headers = response.headers.map(({ key, value }) => `${key}: ${value}`)

  return [statusLine, ...headers, "", formatBody(response.body)].join("\n")
}
