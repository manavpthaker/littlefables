"""
Gemini Image Generation Script for Azi's Little Bhen
Uses Nano Banana Pro (gemini-3-pro-image-preview) for high-quality image generation
"""

from google import genai
from google.genai import types
from PIL import Image
import os
from pathlib import Path

# Initialize the client with your API key
# Get your API key from: https://aistudio.google.com/apikey
# Option 1: Set GOOGLE_API_KEY environment variable
# Option 2: Replace the string below with your actual key
API_KEY = os.environ.get("GOOGLE_API_KEY", "YOUR_API_KEY_HERE")

if API_KEY == "YOUR_API_KEY_HERE":
    print("=" * 60)
    print("WARNING: No API key configured!")
    print("Get your API key from: https://aistudio.google.com/apikey")
    print("Then set it via:")
    print("  export GOOGLE_API_KEY='your-key-here'")
    print("Or edit this file and replace YOUR_API_KEY_HERE")
    print("=" * 60)

client = genai.Client(api_key=API_KEY)

# Output directory for generated images
OUTPUT_DIR = Path(__file__).parent / "Generated Images"
OUTPUT_DIR.mkdir(exist_ok=True)


def generate_image(
    prompt: str,
    output_filename: str = "generated_image.png",
    aspect_ratio: str = "1:1",
    resolution: str = "2K",
    model: str = "gemini-3-pro-image-preview"
) -> str:
    """
    Generate an image using Gemini's Nano Banana Pro model.

    Args:
        prompt: Text description of the image to generate
        output_filename: Name for the output file
        aspect_ratio: "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
        resolution: "1K", "2K", or "4K" (only for gemini-3-pro-image-preview)
        model: "gemini-3-pro-image-preview" (Nano Banana Pro) or "gemini-2.5-flash-image" (Nano Banana)

    Returns:
        Path to the saved image
    """
    config = types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio=aspect_ratio,
            image_size=resolution if model == "gemini-3-pro-image-preview" else None
        ),
    )

    response = client.models.generate_content(
        model=model,
        contents=[prompt],
        config=config
    )

    output_path = OUTPUT_DIR / output_filename

    for part in response.parts:
        if part.text is not None:
            print(f"Model response: {part.text}")
        elif part.inline_data is not None:
            image = part.as_image()
            image.save(output_path)
            print(f"Image saved to: {output_path}")
            return str(output_path)

    return None


def edit_image_with_references(
    prompt: str,
    reference_images: list[str],
    output_filename: str = "edited_image.png",
    aspect_ratio: str = "1:1",
    resolution: str = "2K"
) -> str:
    """
    Generate an image using reference images for character/style consistency.
    Gemini 3 Pro Image supports up to 14 reference images.

    Args:
        prompt: Text description of the desired output
        reference_images: List of paths to reference images (up to 14)
        output_filename: Name for the output file
        aspect_ratio: Aspect ratio for the output
        resolution: "1K", "2K", or "4K"

    Returns:
        Path to the saved image
    """
    contents = [prompt]

    for img_path in reference_images[:14]:  # Max 14 images
        img = Image.open(img_path)
        contents.append(img)

    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE'],
            image_config=types.ImageConfig(
                aspect_ratio=aspect_ratio,
                image_size=resolution
            ),
        )
    )

    output_path = OUTPUT_DIR / output_filename

    for part in response.parts:
        if part.text is not None:
            print(f"Model response: {part.text}")
        elif part.inline_data is not None:
            image = part.as_image()
            image.save(output_path)
            print(f"Image saved to: {output_path}")
            return str(output_path)

    return None


def create_chat_session():
    """
    Create a multi-turn chat session for iterative image editing.

    Returns:
        Chat session object
    """
    chat = client.chats.create(
        model="gemini-3-pro-image-preview",
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE'],
        )
    )
    return chat


def chat_generate(chat, message: str, output_filename: str = None) -> str:
    """
    Send a message in a chat session for iterative image generation/editing.

    Args:
        chat: Chat session from create_chat_session()
        message: Text prompt or edit instruction
        output_filename: Optional filename for saving the image

    Returns:
        Path to saved image if one was generated
    """
    response = chat.send_message(message)

    for part in response.parts:
        if part.text is not None:
            print(f"Model: {part.text}")
        elif image := part.as_image():
            if output_filename:
                output_path = OUTPUT_DIR / output_filename
                image.save(output_path)
                print(f"Image saved to: {output_path}")
                return str(output_path)
            else:
                image.show()

    return None


# Example usage for children's book illustration
if __name__ == "__main__":
    # Example: Generate a children's book illustration
    prompt = """
    Create a warm, whimsical children's book illustration in a soft watercolor style.
    A young Indian boy named Azi, around 4 years old, with curly black hair and big brown eyes,
    sitting in a cozy living room with his family. The style should be similar to
    modern children's picture books - soft colors, rounded features, and a warm,
    inviting atmosphere. The illustration should be suitable for a children's book page.
    """

    # Uncomment to test:
    # generate_image(
    #     prompt=prompt,
    #     output_filename="test_scene.png",
    #     aspect_ratio="3:2",  # Landscape for book spread
    #     resolution="2K"
    # )

    print("Gemini Image Generation script ready!")
    print(f"Output directory: {OUTPUT_DIR}")
    print("\nAvailable functions:")
    print("  - generate_image(prompt, output_filename, aspect_ratio, resolution)")
    print("  - edit_image_with_references(prompt, reference_images, output_filename)")
    print("  - create_chat_session() + chat_generate(chat, message)")
