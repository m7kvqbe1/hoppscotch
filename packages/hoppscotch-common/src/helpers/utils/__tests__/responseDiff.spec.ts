import { describe, expect, test } from "vitest"
import { getDefaultRESTRequest } from "@hoppscotch/data"
import { getResponseDiffText, isComparableResponse } from "../responseDiff"
import type { HoppRESTResponse } from "~/helpers/types/HoppRESTResponse"

const makeResponse = (
  body: string,
  overrides: Partial<{ statusCode: number; statusText: string }> = {}
) =>
  ({
    type: "success",
    statusCode: 200,
    statusText: "OK",
    headers: [{ key: "content-type", value: "application/json" }],
    body: new TextEncoder().encode(body).buffer,
    meta: { responseSize: body.length, responseDuration: 10 },
    req: getDefaultRESTRequest(),
    ...overrides,
  }) as const

describe("isComparableResponse", () => {
  test("accepts responses with a status and body", () => {
    expect(isComparableResponse(makeResponse("{}"))).toBe(true)
    expect(
      isComparableResponse({
        ...makeResponse("{}"),
        type: "fail",
      } as unknown as HoppRESTResponse)
    ).toBe(true)
  })

  test("rejects missing, loading and network failure responses", () => {
    const req = getDefaultRESTRequest()
    expect(isComparableResponse(null)).toBe(false)
    expect(isComparableResponse(undefined)).toBe(false)
    expect(isComparableResponse({ type: "loading", req })).toBe(false)
    expect(
      isComparableResponse({ type: "network_fail", error: "offline", req })
    ).toBe(false)
  })
})

describe("getResponseDiffText", () => {
  test("renders the status line, headers and pretty printed JSON body", () => {
    expect(getResponseDiffText(makeResponse('{"id":1,"name":"a"}'))).toBe(
      [
        "200 OK",
        "content-type: application/json",
        "",
        "{",
        '  "id": 1,',
        '  "name": "a"',
        "}",
      ].join("\n")
    )
  })

  test("keeps a non JSON body as it is", () => {
    expect(
      getResponseDiffText(
        makeResponse("<p>hi</p>", { statusCode: 404, statusText: "" })
      )
    ).toBe(
      ["404", "content-type: application/json", "", "<p>hi</p>"].join("\n")
    )
  })

  test("a changed field changes only its own line", () => {
    const before = getResponseDiffText(makeResponse('{"id":1,"count":1}'))
    const after = getResponseDiffText(makeResponse('{"id":1,"count":2}'))

    const changed = before
      .split("\n")
      .filter((line, i) => line !== after.split("\n")[i])
    expect(changed).toEqual(['  "count": 1'])
  })
})
