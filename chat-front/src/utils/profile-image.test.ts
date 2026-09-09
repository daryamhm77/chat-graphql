import { validateProfileImage } from './profile-image.ts'

describe('validateProfileImage', () => {
  it('rejects a non-JPEG file', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    expect(validateProfileImage(file)).toBe('Please choose a JPEG image.')
  })

  it('rejects a file over 100 KB', () => {
    const file = new File([new Uint8Array(100_001)], 'photo.jpg', {
      type: 'image/jpeg',
    })
    expect(validateProfileImage(file)).toBe('Image must be 100 KB or smaller.')
  })

  it('accepts a small JPEG', () => {
    const file = new File([new Uint8Array(12)], 'photo.jpg', {
      type: 'image/jpeg',
    })
    expect(validateProfileImage(file)).toBeUndefined()
  })
})
