import { OAuth2Client, TokenPayload } from "google-auth-library";
import { AppError } from "../../errors/error";

class GoogleService {
  private readonly client = new OAuth2Client();
  constructor() {}
  verify = async (token: string): Promise<TokenPayload> => {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID!,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError("no provided payload", 404);
    }

    return payload;
  };
}

export default GoogleService;
