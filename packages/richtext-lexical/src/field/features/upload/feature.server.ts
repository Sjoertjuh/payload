import type { Field } from 'payload/types'

import payload from 'payload'

import type { HTMLConverter } from '../converters/html/converter/types'
import type { FeatureProviderProviderServer } from '../types'
import type { UploadFeaturePropsClient } from './feature.client'

import { UploadFeatureClientComponent } from './feature.client'
import { type SerializedUploadNode, UploadNode } from './nodes/UploadNode'
import { uploadPopulationPromiseHOC } from './populationPromise'
import { uploadValidation } from './validate'

export type UploadFeatureProps = {
  collections: {
    [collection: string]: {
      fields: Field[]
    }
  }
}

/**
 * Get the absolute URL for an upload URL by potentially prepending the serverURL
 */
function getAbsoluteURL(url: string): string {
  return url?.startsWith('http') ? url : (payload?.config?.serverURL || '') + url
}

export const UploadFeature: FeatureProviderProviderServer<
  UploadFeatureProps,
  UploadFeaturePropsClient
> = (props) => {
  if (!props) {
    props = { collections: {} }
  }

  const clientProps: UploadFeaturePropsClient = { collections: {} }
  if (props.collections) {
    for (const collection in props.collections) {
      clientProps.collections[collection] = {
        hasExtraFields: props.collections[collection].fields.length >= 1,
      }
    }
  }

  return {
    feature: () => {
      return {
        ClientComponent: UploadFeatureClientComponent,
        clientFeatureProps: clientProps,
        generateSchemaMap: ({ props }) => {
          if (!props?.collections) return {}

          const map: {
            [key: string]: Field[]
          } = {}

          for (const collection in props.collections) {
            map[collection] = props.collections[collection].fields
          }

          return map
        },
        nodes: [
          {
            converters: {
              html: {
                converter: async ({ node }) => {
                  const uploadDocument: any = await payload.findByID({
                    id: node.value.id,
                    collection: node.relationTo,
                  })
                  const url: string = getAbsoluteURL(uploadDocument?.url as string)

                  /**
                   * If the upload is not an image, return a link to the upload
                   */
                  if (!(uploadDocument?.mimeType as string)?.startsWith('image')) {
                    return `<a href="${url}" rel="noopener noreferrer">${uploadDocument.filename}</a>`
                  }

                  /**
                   * If the upload is a simple image with no different sizes, return a simple img tag
                   */
                  if (!uploadDocument?.sizes || !Object.keys(uploadDocument?.sizes).length) {
                    return `<img src="${url}" alt="${uploadDocument?.filename}" width="${uploadDocument?.width}"  height="${uploadDocument?.height}"/>`
                  }

                  /**
                   * If the upload is an image with different sizes, return a picture element
                   */
                  let pictureHTML = '<picture>'

                  // Iterate through each size in the data.sizes object
                  for (const size in uploadDocument.sizes) {
                    const imageSize = uploadDocument.sizes[size]

                    // Skip if any property of the size object is null
                    if (
                      !imageSize.width ||
                      !imageSize.height ||
                      !imageSize.mimeType ||
                      !imageSize.filesize ||
                      !imageSize.filename ||
                      !imageSize.url
                    ) {
                      continue
                    }
                    const imageSizeURL: string = getAbsoluteURL(imageSize?.url as string)

                    pictureHTML += `<source srcset="${imageSizeURL}" media="(max-width: ${imageSize.width}px)" type="${imageSize.mimeType}">`
                  }

                  // Add the default img tag
                  pictureHTML += `<img src="${url}" alt="Image" width="${uploadDocument.width}" height="${uploadDocument.height}">`
                  pictureHTML += '</picture>'

                  return pictureHTML
                },
                nodeTypes: [UploadNode.getType()],
              } as HTMLConverter<SerializedUploadNode>,
            },
            node: UploadNode,
            populationPromises: [uploadPopulationPromiseHOC(props)],
            validations: [uploadValidation()],
          },
        ],
        serverFeatureProps: props,
      }
    },
    key: 'upload',
    serverFeatureProps: props,
  }
}