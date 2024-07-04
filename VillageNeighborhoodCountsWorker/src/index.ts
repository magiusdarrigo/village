import supabaseClient from "./supabaseClient";

const getAllNeighborhoods = async () => {
  const { data: neighborhoods, error } = await supabaseClient
    .from("neighborhoods")
    .select("id");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  return neighborhoods;
};

const updateNeighborhoodCounts = async (neighborhoodId: number) => {
  const { error, count } = await supabaseClient
    .from("users")
    .select("id", { count: "exact" })
    .eq("neighborhood_id", neighborhoodId);

  if (error) {
    console.error(
      `Error fetching counts of users for neighborhood ${neighborhoodId}:`,
      error
    );
    return;
  }

  if (!count) {
    console.info(
      `count returned no results for neighborhood ${neighborhoodId}`
    );
    return;
  }

  const { error: updateError } = await supabaseClient
    .from("neighborhoods")
    .update({ members_count: count })
    .eq("id", neighborhoodId);

  if (updateError) {
    console.error(
      `Error updating members_count for neighborhood ${neighborhoodId}:`,
      updateError
    );
    return;
  }
};

const main = async () => {
  const neighborhoods = await getAllNeighborhoods();
  if (!neighborhoods) {
    throw new Error("No neighborhoods found");
  }
  for (const neighborhood of neighborhoods) {
    updateNeighborhoodCounts(neighborhood.id);
    // sleep for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
};
main();
