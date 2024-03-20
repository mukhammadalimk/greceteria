import { useContext, useState } from "react";
import Counter from "../UI/Counter";
import { UserContext } from "../../store/UserContext";
import { addToWishlist, removeFromWishlist } from "../../api/user";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

const ProductActions = ({
  category,
  store,
  inStock,
  id,
}: ProductActionsProps) => {
  const [wishlistAdded, setWishlistAdded] = useState<boolean>(false);
  const [wishlistRemoved, setWishlistRemoved] = useState<boolean>(false);
  const { state, dispatch } = useContext(UserContext);

  const onToggleWishlist = async () => {
    if (!state.user?.wishlisted.includes(id)) {
      setWishlistAdded(true);
      await addToWishlist(dispatch, id);
      setWishlistAdded(false);
      return;
    }
    setWishlistRemoved(true);
    await removeFromWishlist(dispatch, id);
    setWishlistRemoved(false);
  };
  return (
    <>
      <div className="product__info--item">
        <div className="product__info--action">
          <Counter id={id} inStock={inStock} cartIcon />

          <button
            className="wishlist"
            onClick={onToggleWishlist}
            disabled={(wishlistAdded || wishlistRemoved) && true}
          >
            {(state.user?.wishlisted.includes(id) || wishlistAdded) &&
              !wishlistRemoved && <FavoriteIcon className="full-icon" />}
            {(!state.user?.wishlisted.includes(id) || wishlistRemoved) &&
              !wishlistAdded && <FavoriteBorderIcon />}
          </button>
        </div>
      </div>
      <div className="product__info--item">
        <div className="product__info--last">
          <h5>
            Category: <span>{category}</span>
          </h5>
          <h5>
            Store: <span>{store}</span>
          </h5>
        </div>
      </div>
    </>
  );
};

interface ProductActionsProps {
  category: string;
  store: string;
  inStock: boolean;
  id: string;
}

export default ProductActions;
